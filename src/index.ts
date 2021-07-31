
import './lib/Utilities.tsx';
import { DynConfig } from './lib/DynConfig';
import {FlowLayout, GridLayout} from './lib/Layouts';
import TextBox from './lib/components/TextBox';
import Label from './lib/components/Label';
import DropdownList from './lib/components/DropdownList';
import Button from './lib/components/Button';
import Hidden from './lib/components/Hidden';
import Table from './lib/components/Table';
import ViewLoader from './lib/components/ViewLoader';
import CheckBox from './lib/components/CheckBox';
import CheckBoxList from './lib/components/CheckBoxList';
import RadioList from './lib/components/RadioList';
import DataList from './lib/components/DataList';
import TextArea from './lib/components/TextArea';
import HtmlTemplate from './lib/components/HtmlTemplate';

export * from './lib/Defs';
export * from './lib/View';
export * from './lib/Field';
export * from './lib/ConfigLoader';
export * from './lib/BaseComponent';
export * from './lib/WizardPage';
export * from './lib/DynConfig';
export * from './lib/DataPool';
export * from './lib/DataStorage';
export {TableConfig} from './lib/components/Table';
export {execApiAsync} from './lib/Utilities';   



DynConfig.exportControls({
  'viewloader': ViewLoader,
  'textbox': TextBox,
  'label': Label,
  'dropdownlist': DropdownList,
  'button': Button,
  'hidden': Hidden,
  'table': Table,
  'checkbox': CheckBox,
  'checkboxlist': CheckBoxList,
  'radiolist': RadioList,
  'datalist': DataList,
  'textarea': TextArea,
  'htmltemplate': HtmlTemplate
});

DynConfig.exportLayouts({
  'flowlayout': FlowLayout,
  'gridlayout': GridLayout
});
