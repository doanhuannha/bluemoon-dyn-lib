import { BuildMessageFunction, KeyPair } from './Defs';

import ReactDOM from 'react-dom';
import { DataPool } from './DataPool';

export const DynConfig = {
  debug: false,
  apiCache: true,
  appDOM: ReactDOM,
  exportLayouts: function (layouts: KeyPair) {
    if (DataPool.allLayouts == null) DataPool.allLayouts = {};
    DataPool.allLayouts = {
      ...DataPool.allLayouts,
      ...layouts
    }
  },
  exportPages: function (pages: KeyPair) {
    if (DataPool.allPages == null) DataPool.allPages = {};
    DataPool.allPages = {
      ...DataPool.allPages,
      ...pages
    }
  },

  exportControls: function (ctrls: KeyPair) {
    if (DataPool.allControls == null) DataPool.allControls = {};
    DataPool.allControls = {
      ...DataPool.allControls,
      ...ctrls
    }
  },
  customValidationMessage: null as BuildMessageFunction

}

