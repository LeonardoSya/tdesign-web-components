import 'tdesign-web-components/date-picker';
import 'tdesign-web-components/space';

import { Component } from 'omi';

export default class DatePickerWeekDemo extends Component {
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
          mode="week"
          clearable
          allowInput
          value={this.state.value}
          onChange={this.handleChange}
          placeholder="请选择周"
        />
      </t-space>
    );
  }
}
