The reason that the user logs and analytics pages were redirecting back to the dashboard
was because of an issue in the service worker file which was redirecting any request with
query parameters back to the root path.

To fix this, we allowed exceptions to this query parameter check for analytics, userlogs,
reports, and settings. In the future, we might want to specify which paths we want to
redirect in the service worker such that other sites are not affected by any redirection
from the service worker.