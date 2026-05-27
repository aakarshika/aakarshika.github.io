import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { openResumePdfFromHtmlString } from './openResumePdfFromHtml.js';

const originalWindow = globalThis.window;

afterEach(() => {
  globalThis.window = originalWindow;
});

test('writes generated resume HTML into a blank popup so the download name is not derived from a blob URL', () => {
  let openedUrl;
  let writtenHtml = '';
  let closed = false;

  globalThis.window = {
    open(url) {
      openedUrl = url;

      return {
        document: {
          open() {},
          write(html) {
            writtenHtml = html;
          },
          close() {
            closed = true;
          },
        },
      };
    },
  };

  const opened = openResumePdfFromHtmlString(
    '<!doctype html><html><head></head><body>Resume</body></html>',
    'AakarshikaPriydarshi_resume_java.pdf'
  );

  assert.equal(opened, true);
  assert.equal(openedUrl, '');
  assert.match(writtenHtml, /window\.__FORCE_RESUME_PDF_DOWNLOAD__=1/);
  assert.match(writtenHtml, /window\.__RESUME_PDF_FILENAME__="AakarshikaPriydarshi_resume_java\.pdf"/);
  assert.equal(closed, true);
});
