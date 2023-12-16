import { chromium, firefox, webkit, selectors, devices, errors, request } from 'playwright';
import playwright from 'playwright';

import testESM from './esm.mjs';
testESM({ chromium, firefox, webkit, selectors, devices, errors, request, playwright }, [chromium, firefox, webkit]);
