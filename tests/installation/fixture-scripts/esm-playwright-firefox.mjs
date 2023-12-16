import { chromium, firefox, webkit, selectors, devices, errors, request } from 'playwright-firefox';
import playwright from 'playwright-firefox';

import testESM from './esm.mjs';
testESM({ chromium, firefox, webkit, selectors, devices, errors, request, playwright }, [firefox]);
