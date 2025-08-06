# Bug fix 2025/08/05
BLUF: An improper way to redirect users used, which led to the user facing page defaults when upon redirection. We fixed it by using React's `useNavigate`.`

## Overview

Two bugs were identified by users in testing

1. When users changed the date filter on the Analytics.js page, they were redirected to the main dashboard.
2. When users searched for themselves on the ActivityLog.js page, they were left with a hanging query.

In the process of patching these bugs an additional bug was discovered. Upon navigating to any other page, the user would encounter two different loading pages one after the other, causing user friction and confusion.

We were only able to root cause the first of the two bugs.
## Bug details and fix

### Root caus
The bug here was that we were improperly redirecting using window.location.href. This caused the DOM to reset upon every refresh, bringing the context back to the defaults.In the case of the Analytics page, this meant that we would go back to the default endpoint `/`, and `isLoading` would be set to the default value of `true`, resulting in the loading page being rendered. 

### Fix
We refactored the codebase to use `useNavigate` from the `react-router-dom` package in place of the previously hardcoded redirect. This allows us to redirect the user without reseting the DOM.

### Alternative solutions
We also considered storing previous session states within the local browser storage, however this solution was deemed to be more complex, more error prone, and harder to maintain than using existing React frameworks.

## TODO
We still need to resolve the hanging query for ActivityLog.js.
