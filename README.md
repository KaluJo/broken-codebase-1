# User Logs Search and Analytics Time Lookback Window Bug Post Mortem

Issue:
The issue with the user logs search was that when the 'Load Logs' button was clicked the user would be redirected to the main dashboard page. This was due to the use of window.location.href being redefined which caused a full page reset and bypassed the React Router. When reloaded it would default to the main page of the dashboard. After this issue was resolved there was another bug where the activity logs would not be loaded after the search and stuck on the loading message. This was caused by a circular dependency within useEffect hooks which was updating dependencies within different hooks. This would cause infinite loops and loading.

Solution:
The solution was to instead use the React Router's navigate function rather than the window.href.location. This performs client side routing, kept the state and didn't cause a full reload. The solution to the logs not loading was first removing the unnecessary dependencies from the useEffect hooks. This included location.pathname, pagination.viewCount and others. Specifically the main useEffect would set the user which would then update the filters which would setLoading as true and set the logs to none which would cause an infinite loading state. Also session tracking would trigger setFilters which would then cause the whole loading state and infinite loop again. I also added user as a conditional in the filter effect to prevent data from trying to loaded before the user was set.

Analytics Time Lookback Window Bug

Issue:
When the lookback window would be set it would reload and go to the main dashboard. This was again due to the user of window.location.href.

Solution: