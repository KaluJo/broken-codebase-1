# Post-Mortem
# Cause
There were two issues in the codebase, namely 1) Incorrectly redirecting any url to the root url "/" and 2) Circular depedendencies in useEffect hooks.

For 1, there was a piece of code in sw.js that was redirecting all navigation requests with a destination of "document" to the root url "/". Simply removing that piece of code resolved the issue.

For 2, there are two useEffect hooks in ActivityLog that both updated the `user` object and the `filters` object, causing the app to hang.

# How you discovered the issue
I began by looking at the relevant files in the codebase corresponding to the pages and narrowed down the areas in the code that might be problematic. I then used that to prompt the Cursor AI to find reasons/parts of the code that might cause the problem.

Cursor AI suggested fixes, which I read through and tested ensure they solved the issue without significantly refactoring the codebase.

# How your team should avoid the issue in the future
For Issue 1, adding more tests (unit tests, integration tests, manual testing etc.) would alert developers of the issue before it is pushed to production. For Issue 2, it is important to check the dependencies used in each useEffect hook to ensure they do not result in circular references.