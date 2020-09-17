# meteor-auth0-lock
Log into your Meteor application from an external resource using the Auth0 lock widget.


## Requirements
Your application needs to install the meteor package optune:meteor-auth0-oauth in order for it to work.

## Options
The following example shows all the options available to configure your lock widget and login parameters.

```

```
## Installation

### Npm
```npm i @onescreener/meteor-auth0-lock```

### Yarn
```yarn add @onescreener/meteor-auth0-lock```

Import the package on start up. Auth0 is added globally.

```
import moment from 'moment'

...

import '@onescreener/meteor-auth0-lock'

...
```

## Setup
To open Auth0 lock provide the options as in the example below

```
const options = {
  type: 'login' // Either 'login', 'signup' or <empty> which shows both options in the widget
  auth0: {
    clientId: 'isWcakHuMWoQlrEIdPhUpb-lo9VOnRzJ',
    domain: 'auth-dev.onescreener.com',
    rootUrl: 'http://localhost:3000',
    path: '/user/profile',
    origin: 'localhost', // Use for cookie control access make
  },

  containerId: 'lock-container', // DIV container id to add the lock inline
  languageDictionary: {
    title: 'Log in',
    signUpTitle: 'Get started for free',
  },
  theme: {
    logo:
      'https://res.cloudinary.com/optune-me/image/upload/c_pad,h_58,w_200/v1558014130/onescreener-v2/app/logo-onescreener.png',
    primaryColor: '#27E200',
  },
}

Auth0.showLock(options)

```


