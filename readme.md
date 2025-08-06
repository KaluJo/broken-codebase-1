# postmortem

## Issue 1: User Loading Button Redirect Instead of Loading Data

### what caused the issue
- Load Logs button updated browser url using window.location.href instead of React Router, causing a full page reload and logging out the user, which leads to a redirect to the main dashboard.

### how i discovered it
- Run the load logs flow
- Checked the effect of the submit button that was triggering the page redirect

### opportunities to improve
- Use React Router instead of full refresh
- Test for button effects

## Issue 2: Analytics Redirect After Selecting Date Range

### what caused the issue
- Date range change handler was updating URL query param by triggering full refresh, causing redirect to main dashboard (same as above)

### how i discovered it
- Run the change date flow
- Checked for full window refresh since it was a similar issue as above

### opportunities to improve
- See above
