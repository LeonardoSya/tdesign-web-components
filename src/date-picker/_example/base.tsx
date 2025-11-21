import 'tdesign-web-components/date-picker';
import 'tdesign-web-components/space';

import { Component } from 'omi';

export default class DatePickerBaseDemo extends Component {
  state = {
    value: '',
    weekValue: '',
    monthValue: '',
    quarterValue: '',
    yearValue: '',
  };

  handleChange = (value: string) => {
    this.state.value = value;
    this.update();
  };

  handleModeChange = (key: 'weekValue' | 'monthValue' | 'quarterValue' | 'yearValue') => (value: string) => {
    this.state[key] = value;
    this.update();
  };

  render() {
    return (
      <t-space direction="vertical">
        <t-date-picker clearable value={this.state.value} onChange={this.handleChange} placeholder="请选择日期" />
        <t-date-picker disabled value={this.state.value} onChange={this.handleChange} placeholder="请选择日期" />
        <t-date-picker
          mode="week"
          value={this.state.weekValue}
          onChange={this.handleModeChange('weekValue')}
          placeholder="请选择周"
        />
        <t-date-picker
          mode="month"
          value={this.state.monthValue}
          onChange={this.handleModeChange('monthValue')}
          placeholder="请选择月份"
        />
        <t-date-picker
          mode="quarter"
          value={this.state.quarterValue}
          onChange={this.handleModeChange('quarterValue')}
          placeholder="请选择季度"
        />
        <t-date-picker
          mode="year"
          value={this.state.yearValue}
          onChange={this.handleModeChange('yearValue')}
          placeholder="请选择年份"
        />
      </t-space>
    );
  }
}
