import { chromium, firefox, webkit, selectors, devices, errors, request } from 'playwright-chromium';
import playwright from 'playwright-chromium';

import testESM from './esm.mjs';
testESM({ chromium, firefox, webkit, selectors, devices, errors, request, playwright }, [chromium]);
