# Post mortem

There were two issues identified in the application.

## Discovery

The bugs were discovered by a user using the app. The bug affected the User Logs and Analytics pages.
When the user entered a user id on the User Logs page and clicked on the "Load Logs" button, it would redirect them to the home page. Further, the loading screen would appear forever after the redirect bug was fixed on the User Logs page.
The same issue occurred on the Analytics page when changing the time frame filter.

## Cause

The bug causing the redirect issue was caused by assigning a url to the window.location.href property, which causes a reload of the page.
The bug causing the infinite loading screen issue was caused by multiple useEffect hooks depending on different states on the page, causing the "loading" state to be true even when the data has finished loading.

## Fix

The redirect bug was resolved by using the navigate function from the React Router library, which handles routing for the app.
The infinite loading screen bug was resolved by removing redundant useEffect hooks and ensuring the loading state is only set when required.
