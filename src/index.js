import { Random } from './utils/Random'
import { Base64 } from './utils/Base64'

export const Auth0 = {}

let auht0Lock

const Auth0ClientId = process.env.AUTH0_CLIENT_ID
const Auth0Domain = process.env.AUTH0_DOMAIN
const LoginUrl = process.env.LOGIN_URL

// Source: https://github.com/meteor/meteor/blob/master/packages/reload/reload.js
//
// This logic for sessionStorage detection is based on browserstate/history.js
const KEY_NAME = 'Meteor_Reload'

Auth0._checkAuth0Params = ({ options }) => {
  const { auth0 } = options

  let callbackUrl
  if (!auth0) {
    throw 'Auth0 configuration options not set'
  } else {
    if (!auth0.clientId) throw 'Auth0 client id not set'
    if (!auth0.domain) throw 'Auth0 domain not set'
    if (!auth0.rootUrl) throw 'The root url of your target application is not set'
    if (!auth0.origin) throw 'Auth0 origin not set'

    callbackUrl = auth0.path > '' ? `${auth0.rootUrl}${path}` : `${auth0.rootUrl}/`
  }
  return { auth0, callbackUrl }
}

// Source: https://github.com/meteor/meteor/blob/master/packages/oauth/oauth_client.js
Auth0._getCookie = ({ migrationData }) => {
  const cookie = `${KEY_NAME}=${encodeURIComponent(JSON.stringify(migrationData))}; domain=${
    process.env.COOKIE_ORIGIN
  }; max-age=${5 * 60}; path=/;`

  return cookie
}

Auth0._saveDataForRedirect = ({ credentialToken }) => {
  if (credentialToken === undefined || credentialToken === null) return false

  var migrationData = {
    oauth: {
      loginService: 'auth0',
      credentialToken
    }
  }

  try {
    document.cookie = Auth0._getCookie({ migrationData })
  } catch (err) {
    // We should have already checked this, but just log - don't throw
    console.error(err)
    throw "Couldn't save data for migration to cookie"
  }

  return true
}

// Source: https://github.com/meteor/meteor/blob/master/packages/oauth/oauth_client.js
Auth0._stateParam = (credentialToken, redirectUrl) => {
  const state = {
    loginStyle: 'redirect',
    credentialToken,
    isCordova: false
  }

  console.log(state)

  state.redirectUrl = redirectUrl || '' + window.location

  // Encode base64 as not all login services URI-encode the state
  // parameter when they pass it back to us.
  // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.
  return Base64.encode(JSON.stringify(state))
}

// @params type: Can be 'login' or 'signup'
// @params auth0 (required): Auth0 configuration object
//   - clientId: Auth0 client id
//   - domain: Auth0 domain
//   - rootUrl: Base url of application
//   - origin: Origin settings of application for cookies
//   - path: Path added to root url after succesful login. If not set, same as root url.
// @params containerId: Id of the html element the lock widget shall be shown inline. If not set a overlay will be shown
// @params languageDictionary: Custom text for lock widget
// @params theme: Themeing for lock widget
Auth0.showLock = (options = { type: 'login' }) => {
  // Check configuration
  const { auth0, callbackUrl } = Auth0._checkAuth0Params({ options })

  const credentialToken = Random.secret()
  Auth0._saveDataForRedirect({ credentialToken })

  const { type, languageDictionary, theme } = options

  const isLogin = type === 'login'
  const isSignup = type === 'signup'
  let redirectUrl = `${auth0.rootUrl}/_oauth/auth0`

  if (type) {
    redirectUrl = `${redirectUrl}#${type}`
  }

  // Combine lock options
  const lockOptions = {
    auth: {
      redirectUrl,
      params: {
        state: Auth0._stateParam(credentialToken, callbackUrl)
      }
    },
    allowedConnections: (isSignup && ['Username-Password-Authentication']) || null,
    rememberLastLogin: true,
    languageDictionary,
    theme,
    closable: true,
    container: options.containerId,
    allowLogin: isLogin,
    allowSignUp: isSignup
  }

  // Initialize lock
  auht0Lock = new Auth0Lock(Auth0ClientId, Auth0Domain, lockOptions)

  // Show lock
  auht0Lock.show()
}

// @params auth0 (required): Auth0 configuration object
//   - clientId: Auth0 client id
//   - domain: Auth0 domain
//   - rootUrl: Base url of application
//   - origin: Origin settings of application for cookies
//   - path: Path added to root url after succesful login. If not set, same as root url.
Auth0.authenticate = (options = {}) => {
  // Check configuration
  const { auth0, callbackUrl } = Auth0._checkAuth0Params({ options })

  const credentialToken = Random.secret()
  Auth0._saveDataForRedirect({ credentialToken })

  let redirectUrl = `${auth0.rootUrl}/_oauth/auth0`

  redirectUrl = `${redirectUrl}#login`

  const auth0authorizationUrl =
    `https://${auth0.domain}/authorize/` +
    '?scope=openid%20profile%20email' +
    '&response_type=code' +
    '&client_id=' +
    auth0.clientId +
    '&state=' +
    Auth0._stateParam(credentialToken, callbackUrl) +
    `&redirect_uri=${auth0.rootUrl}/_oauth/auth0'`

  console.log('Auhtenticate', auth0authorizationUrl)

  // window.location = auth0authorizationUrl
}

// Close auth0 lock
// @params Id of the html element the lock widget has been added inline.
Auth0.closeLock = (options = {}) => {
  auht0Lock = undefined

  if (options.containerId) {
    // Get the container element
    var container = document.getElementById(options.containerId)

    // As long as <ul> has a child node, remove it
    if (container.hasChildNodes()) {
      container.removeChild(container.firstChild)
    }
  }
}

// Set globally
window.Auth0 = Auth0
