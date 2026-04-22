# API Overview

### Intro
RemotePass provides a REST API to build connections and exchange data with 3rd parties.
For security, include the `x-api-key` header in every request.

### Overview
RemotePass API is built around REST API architecture. In order to provide flexibility for our customers and allow working in test mode, RemotePass provides two environments — production and sandbox.

Sandbox environment does not impact production data and allows testing integrations before going into production. The production environment is connected to the customer's live data and directly impacts it when used. The difference is determined by the base URL and API Key used for authorization.

### Servers

| Type | URL |
|------|-----|
| Staging | https://api-staging.remotepass.com |
| Production | https://api-production.remotepass.com |
