### What caused the issue?
There was code in the service worker that redirected to the root path anytime there was a query parameter in the URL. Then, there was an infinite loop in the Activity log component that caused the component to be stuck in a loading state.

### How the issue was discovered
The issue was discovered by first analyzing the relevant files, and then asking cursor to explain where the error was. Cursor then provided the lines of code to change in the file in order to fix the issue. After the code changes, testing was done on our local to see if the changes fixed the issue.

### How the team can avoid it in the future
The team can avoid this issue in the future by doing more thorough testing before releasing code. That can be done through unit/live dependency tests and also thorough PR reviews. Also, they can ask cursor to review their code.