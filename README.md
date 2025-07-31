# Post-mortem of Hanging Pages

The Enterprise Portal website experienced two issues:

1. Navigating back to the dashboard when loading user logs and updating the time range for the analytics dashboard

2. The activity log not loading after loading a specific user ID

## Issue 1 Discovery

The first issue was discovered when the customer went to localhost:3000/user-logs, entered a user id, and attempted to view a user id's activity logs after hitting the button "Load Logs". The website navigated back to localhost:3000/dashboard.

The second part of the issue was when customer went to localhost:3000/analytics and updated the timerange, which also navigated back to localhost:3000/dashboard.

## Issue 1 Solution

To solve Issue 1, the `onChange` functions from loading the logs or updating the time range used `window.location.href` to navigate instead of the React Router navigation. In the future, we should always use the React Router navigation to avoid a full page reload.

## Issue 2 Discovery

The issue of the continuously hanging activity log was discovered after solving the first issue and attempting to load the activity log of a user ID. After pressing "Load Logs", the activity log continued to load without showing any of the user data.

## Issue 2 Solution

Issue 2 resulted in an infinite loading loop due to circular dependencies and infinite loops in the useEffects in the ActivityLog component. The useEffects would continuously fetch data and use dependencies that were not used in the useEffect loop. 

