## Incident Post-Mortem

### Service Worker Redirect Loop and Query Parameter Handling Issue

**Date:** [Current Date]  
**Duration:** N/A (Ongoing until resolution)  
**Severity:** High - Impacted core navigation functionality  
**Status:** Resolved

---

### Summary

The application's service worker (`public/sw.js`) contained faulty logic that interfered with normal navigation to URLs containing query parameters. This resulted in either infinite redirect loops or unintended stripping of query parameters, preventing users from accessing specific application states that relied on URL parameters (e.g., `/user-logs?user=john`).

### Root Cause

We discovered the initial issue from a spot check in the Admin Panel, where pages that req'd dynamic query params were redirecting to the home page.

After some debugging, I found that the service worker implemented overly aggressive URL handling logic that intercepted all requests containing query parameters (`url.search`). The problematic code block:

```javascript
if (url.search) {    
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      Response.redirect('/, 302)
    );
    return;
  }
}
```

presumably introduced as some sort of special handler (?) broke other parts of the system.

### Prevention Measures

We're regression testing this specific behavior, as well as adding tests to ensure URL routing logic is not invoked in the Service Worker.


### Testing Strategy for Service Worker URL Handling

#### 1. Unit Tests for Service Worker Fetch Handler

```javascript
describe('Service Worker Fetch Handler', () => {
  let mockEvent;
  
  beforeEach(() => {
    mockEvent = {
      request: {
        url: '',
        mode: 'navigate',
        destination: 'document'
      },
      respondWith: jest.fn()
    };
  });

  test('should NOT redirect URLs with query parameters', () => {
    mockEvent.request.url = 'https://example.com/user-logs?user=john';
    handleFetch(mockEvent);
    
    expect(mockEvent.respondWith).toHaveBeenCalledWith(
      expect.not.objectContaining({
        type: 'opaqueredirect'
      })
    );
  });

  test('should handle cache-first strategy for parameterized URLs', () => {
    mockEvent.request.url = 'https://example.com/analytics?range=30d';
    handleFetch(mockEvent);
    
    expect(mockEvent.respondWith).toHaveBeenCalledWith(
      expect.any(Promise)
    );
  });

  test('should NOT contain URL routing logic', () => {
    const swCode = fs.readFileSync('public/sw.js', 'utf8');
    
    expect(swCode).not.toMatch(/Response\.redirect/);
    expect(swCode).not.toMatch(/url\.pathname/);
    expect(swCode).not.toMatch(/if.*url\.search/);
  });
});
```

#### 2. Integration Tests for Navigation Behavior

```javascript
describe('URL Navigation Integration', () => {
  test('should preserve query parameters during navigation', async () => {
    await page.goto('http://localhost:3000/user-logs?user=testuser');
    
    const currentUrl = await page.url();
    expect(currentUrl).toContain('?user=testuser');
    
    const navigationHistory = await page.evaluate(() => window.history.length);
    expect(navigationHistory).toBe(1);
  });

  test('should handle deep linking correctly', async () => {
    const deepLinkUrl = 'http://localhost:3000/analytics?range=7d&metric=revenue';
    await page.goto(deepLinkUrl);
    
    await page.waitForSelector('[data-testid="analytics-page"]');
    expect(await page.url()).toBe(deepLinkUrl);
  });
});
```

#### 3. Service Worker Behavioral Tests

```javascript
describe('Service Worker Behavior', () => {
  test('should only handle caching, not URL routing', async () => {
    await page.evaluateOnNewDocument(() => {
      navigator.serviceWorker.register('/sw.js');
    });

    const requests = [];
    page.on('request', request => requests.push(request.url()));

    await page.goto('http://localhost:3000/reports?type=monthly');
    
    const redirects = requests.filter(url => 
      url !== 'http://localhost:3000/reports?type=monthly' && 
      url.includes('reports')
    );
    expect(redirects).toHaveLength(0);
  });
});
```

#### 4. Static Analysis Tests

```javascript
describe('Service Worker Static Analysis', () => {
  test('should not contain URL manipulation patterns', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    
    const forbiddenPatterns = [
      /Response\.redirect\(/,
      /url\.pathname\s*[+]/,
      /location\.href\s*=/,
      /window\.location/,
      /history\.pushState/,
      /history\.replaceState/
    ];

    forbiddenPatterns.forEach(pattern => {
      expect(swContent).not.toMatch(pattern);
    });
  });

  test('should only contain caching-related logic', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    
    expect(swContent).toMatch(/caches\.match/);
    expect(swContent).toMatch(/caches\.open/);
    expect(swContent).toMatch(/cache\.addAll/);
    
    expect(swContent).not.toMatch(/router/i);
    expect(swContent).not.toMatch(/route/i);
  });
});
```

#### 5. End-to-End Validation Tests

```javascript
describe('URL Handling E2E', () => {
  const testUrls = [
    '/dashboard?tab=overview',
    '/user-logs?user=admin&limit=50',
    '/analytics?range=30d&breakdown=daily',
    '/reports?type=audit&format=csv'
  ];

  testUrls.forEach(url => {
    test(`should handle ${url} without modification`, async () => {
      const fullUrl = `http://localhost:3000${url}`;
      
      const response = await page.goto(fullUrl);
      
      expect(response.status()).toBe(200);
      expect(response.url()).toBe(fullUrl);
      
      const finalUrl = await page.url();
      expect(finalUrl).toBe(fullUrl);
    });
  });
});
```

#### 6. Continuous Monitoring

```javascript
afterEach(async () => {
  const consoleLogs = await page.evaluate(() => 
    window.console._logs?.filter(log => 
      log.includes('redirect') || log.includes('loop')
    ) || []
  );
  
  expect(consoleLogs).toHaveLength(0);
});
```

These tests would have caught all the issues we encountered:
- ✅ Initial homepage redirects
- ✅ Infinite redirect loops  
- ✅ Query parameter stripping
- ✅ Ensure service worker stays within caching boundaries

### Action Items

- [x] Remove problematic query parameter handling from service worker
- [ ] Add automated tests for URL navigation patterns
- [ ] Document service worker functionality and limitations
- [ ] Review other potential over-engineered URL handling in the application

---

**Reviewer**: [kwesi]  
**Approved**: [7/29]

