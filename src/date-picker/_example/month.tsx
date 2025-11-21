import 'tdesign-web-components/date-picker';
import 'tdesign-web-components/space';

import { Component } from 'omi';

export default class DatePickerMonthDemo extends Component {
  state = {
    value: '',
  };

  handleChange = (value: string) => {
    this.state.value = value;
    this.update();
  };

  render() {
    return (
      <t-space direction="vertical">
        <t-date-picker
          mode="month"
          clearable
          allowInput
          value={this.state.value}
          onChange={this.handleChange}
          placeholder="请选择月份"
        />
      </t-space>
    );
  }
}
