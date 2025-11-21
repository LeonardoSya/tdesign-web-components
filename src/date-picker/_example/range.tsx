import 'tdesign-web-components/date-picker';
import 'tdesign-web-components/space';

import { Component } from 'omi';

export default class DateRangePickerDemo extends Component {
  state = {
    value: ['', ''],
    disabledValue: ['2024-01-01', '2024-01-15'],
  };

  handleChange = (value: string[]) => {
    this.state.value = value;
    this.update();
  };

  handleDisabledChange = (value: string[]) => {
    this.state.disabledValue = value;
    this.update();
  };

  render() {
    return (
      <t-space direction="vertical">
        <t-date-range-picker
          clearable
          value={this.state.value}
          onChange={this.handleChange}
          placeholder={['开始日期', '结束日期']}
        />
        <t-date-range-picker
          disabled
          value={this.state.disabledValue}
          onChange={this.handleDisabledChange}
          placeholder={['开始日期', '结束日期']}
        />
      </t-space>
    );
  }
}
