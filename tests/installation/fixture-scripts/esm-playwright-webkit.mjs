import { chromium, firefox, webkit, selectors, devices, errors, request } from 'playwright-webkit';
import playwright from 'playwright-webkit';

import testESM from './esm.mjs';
testESM({ chromium, firefox, webkit, selectors, devices, errors, request, playwright }, [webkit]);
