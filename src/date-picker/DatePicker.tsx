import '../select-input';
import './panel/SinglePanel';
import 'tdesign-icons-web-components/esm/components/calendar';

import dayjs from 'dayjs';
import { classNames, Component, OmiProps, signal, tag } from 'omi';

import { formatDate, getDefaultFormat, parseToDayjs } from '../_common/js/date-picker/format';
import { addMonth, covertToDate, subtractMonth } from '../_common/js/date-picker/utils';
import { getClassPrefix } from '../_util/classname';
import useControlled from '../_util/useControlled';
import { StyledProps } from '../common';
import { datePickerDefaultProps } from './defaultProps';
import { DateValue, TdDatePickerProps } from './type';

export interface DatePickerProps extends Omit<TdDatePickerProps, 'style'>, Omit<StyledProps, 'style'> {
  style?: TdDatePickerProps['style'];
}

@tag('t-date-picker')
export default class DatePicker extends Component<DatePickerProps> {
  static defaultProps = datePickerDefaultProps;

  static propTypes = {
    value: [String, Number, Object, Array],
    defaultValue: [String, Number, Object, Array],
    popupVisible: Boolean,
    defaultPopupVisible: Boolean,
    format: String,
    mode: String,
    enableTimePicker: Boolean,
    disabled: Boolean,
    preset: [Array, Object],
    placeholder: String,
    tips: [String, Object, Function],
    status: String,
    borderless: Boolean,
    onChange: Function,
    onPick: Function,
    onClear: Function,
    onVisibleChange: Function,
  };

  private classPrefix = getClassPrefix();

  private formatInfo = getDefaultFormat({ mode: 'date' });

  private valueState: DateValue;

  private setValueState: (value: DateValue, context?: any) => void;

  private popupVisibleState = false;

  private setPopupVisibleState: (visible: boolean, context?: any) => void;

  private inputValueSignal = signal('');

  private cacheValueSignal = signal('');

  private yearSignal = signal(dayjs().year());

  private monthSignal = signal(dayjs().month());

  install() {
    this.initializeControlled(this.props as DatePickerProps);
  }

  receiveProps(nextProps: OmiProps<DatePickerProps, any>) {
    this.initializeControlled(nextProps as DatePickerProps);
  }

  private initializeControlled(props: DatePickerProps) {
    this.setupValueControl(props);
    this.setupPopupControl(props);
    this.formatInfo = getDefaultFormat({
      mode: props.mode,
      format: props.format,
      valueType: props.valueType,
      enableTimePicker: false,
    });
    this.syncDerivedState(this.valueState, props);
  }

  private setupValueControl(props: DatePickerProps) {
    const [value, setValue] = useControlled(props, 'value', (val, context) => props.onChange?.(val, context), {
      defaultValue: props.defaultValue,
      activeComponent: this,
    });
    this.valueState = value as DateValue;
    this.setValueState = (nextValue, context) => {
      setValue(nextValue, context);
      this.valueState = nextValue;
      this.syncDerivedState(nextValue, this.props as DatePickerProps);
    };
  }

  private setupPopupControl(props: DatePickerProps) {
    const [visible, setVisible] = useControlled(
      props,
      'popupVisible',
      (val, context) => props.onVisibleChange?.(val, context),
      {
        defaultPopupVisible: props.defaultPopupVisible,
        activeComponent: this,
      },
    );
    this.popupVisibleState = Boolean(visible);
    this.setPopupVisibleState = (nextVisible, context) => {
      setVisible(nextVisible, context);
      this.popupVisibleState = nextVisible;
    };
  }

  private normalizeValue(value: DateValue | undefined, props: DatePickerProps) {
    if (!value) return value;
    if (value instanceof Date) return value;
    const { valueType, format } = this.formatInfo;
    if (['week', 'quarter'].includes(props.mode)) {
      if (valueType === 'time-stamp') {
        return new Date(Number(value));
      }
      if (valueType === 'Date') {
        return value;
      }
      const dayjsValue = parseToDayjs(value as DateValue, valueType || format);
      if (dayjsValue?.isValid?.()) {
        return dayjsValue.toDate();
      }
      return value;
    }
    return covertToDate(value as string, valueType);
  }

  private syncDerivedState(value: DateValue | undefined, props: DatePickerProps) {
    const { format } = this.formatInfo;
    const normalized = this.normalizeValue(value, props);
    const formatted = formatDate(normalized, { format }) || '';

    this.inputValueSignal.value = formatted;
    this.cacheValueSignal.value = formatted;

    const baseDate =
      (normalized && parseToDayjs(normalized, format)) || (formatted && parseToDayjs(formatted, format)) || dayjs();
    if (baseDate?.isValid?.()) {
      this.yearSignal.value = baseDate.year();
      this.monthSignal.value = baseDate.month();
    }
  }

  private handlePopupVisibleChange = (visible: boolean, context: any) => {
    if (!this.setPopupVisibleState) return;
    this.setPopupVisibleState(visible, context);
    if (!visible) {
      this.inputValueSignal.value = this.cacheValueSignal.value;
    } else {
      this.syncDerivedState(this.valueState, this.props as DatePickerProps);
    }
  };

  private handleClear = (context: CustomEvent) => {
    const detail = context?.detail ?? {};
    this.cacheValueSignal.value = '';
    this.inputValueSignal.value = '';
    this.setValueState?.(undefined, { trigger: 'clear', dayjsValue: dayjs() });
    this.setPopupVisibleState?.(false, { trigger: 'clear', ...detail });
    this.props.onClear?.(detail);
  };

  private handleCellClick = (date: Date) => {
    const { format, valueType } = this.formatInfo;
    const mode = (this.props as DatePickerProps)?.mode ?? 'date';
    const formatted = formatDate(date, { format }) || '';
    const nextValue = formatDate(date, { format, targetFormat: valueType }) as DateValue;

    this.cacheValueSignal.value = formatted;
    this.inputValueSignal.value = formatted;

    if (mode === 'month') {
      this.yearSignal.value = date.getFullYear();
      this.monthSignal.value = date.getMonth();
    } else if (mode === 'quarter') {
      this.yearSignal.value = date.getFullYear();
      this.monthSignal.value = date.getMonth();
    } else if (mode === 'year') {
      this.yearSignal.value = date.getFullYear();
    } else if (mode === 'week' || mode === 'date') {
      this.yearSignal.value = date.getFullYear();
      this.monthSignal.value = date.getMonth();
    }

    const dayjsValue = parseToDayjs(date, format);
    this.setValueState?.(nextValue, {
      dayjsValue,
      trigger: 'pick',
    });
    this.props.onPick?.(date, { dayjsValue, trigger: 'pick' });
    this.setPopupVisibleState?.(false, { trigger: 'pick' });
  };

  private handleCellMouseEnter = (date: Date) => {
    const mode = (this.props as DatePickerProps)?.mode ?? 'date';
    if (mode !== 'date' && mode !== 'week') return;
    const { format } = this.formatInfo;
    this.inputValueSignal.value = formatDate(date, { format }) || '';
  };

  private handleCellMouseLeave = () => {
    const mode = (this.props as DatePickerProps)?.mode ?? 'date';
    if (mode !== 'date' && mode !== 'week') return;
    this.inputValueSignal.value = this.cacheValueSignal.value;
  };

  private handlePanelJumperClick = ({ trigger }: { trigger: 'prev' | 'next' | 'current' }) => {
    const { mode = 'date' } = (this.props as DatePickerProps) ?? {};
    const monthCountMap: Record<string, number> = {
      date: 1,
      week: 1,
      month: 12,
      quarter: 12,
      year: 120,
    };
    const monthCount = monthCountMap[mode] ?? 0;

    const current = new Date(this.yearSignal.value, this.monthSignal.value);
    let target = current;

    if (trigger === 'prev') {
      target = subtractMonth(current, monthCount);
    } else if (trigger === 'next') {
      target = addMonth(current, monthCount);
    } else if (trigger === 'current') {
      target = new Date();
    }

    this.yearSignal.value = target.getFullYear();
    this.monthSignal.value = target.getMonth();
  };

  private handlePanelMonthChange = (month: number) => {
    this.monthSignal.value = month;
  };

  private handlePanelYearChange = (year: number) => {
    this.yearSignal.value = year;
  };

  private renderPanel(props: DatePickerProps) {
    const { format } = this.formatInfo;
    return (
      <t-date-picker-panel
        mode={props.mode}
        format={format}
        value={this.valueState}
        formattedValue={this.cacheValueSignal.value}
        year={this.yearSignal.value}
        month={this.monthSignal.value}
        firstDayOfWeek={props.firstDayOfWeek}
        disableDate={props.disableDate}
        minDate={props.minDate}
        maxDate={props.maxDate}
        onCellClick={(value: Date) => this.handleCellClick(value)}
        onCellMouseEnter={this.handleCellMouseEnter}
        onCellMouseLeave={this.handleCellMouseLeave}
        onJumperClick={this.handlePanelJumperClick}
        onMonthChange={this.handlePanelMonthChange}
        onYearChange={this.handlePanelYearChange}
      />
    );
  }

  render(props: OmiProps<DatePickerProps, any>) {
    const {
      class: className,
      style,
      disabled,
      status,
      tips,
      borderless,
      label,
      clearable,
      placeholder,
      allowInput,
      popupProps,
      inputProps,
      tagInputProps,
      prefixIcon,
      suffixIcon,
    } = props;

    const cls = classNames(`${this.classPrefix}-date-picker`, className);
    const visible = props.popupVisible ?? this.popupVisibleState;
    const panelVNode = this.renderPanel(props as DatePickerProps);

    const prefixIconNode = prefixIcon;
    const suffixIconNode = suffixIcon ?? <t-icon-calendar className="t-icon t-icon-calendar" />;

    return (
      <div class={cls} style={style}>
        <t-select-input
          disabled={disabled}
          value={this.inputValueSignal.value}
          inputValue={this.inputValueSignal.value}
          status={status}
          tips={tips}
          borderless={borderless}
          label={label}
          clearable={clearable}
          allowInput={allowInput}
          placeholder={placeholder}
          popupProps={popupProps}
          inputProps={inputProps}
          tagInputProps={tagInputProps}
          popupVisible={visible}
          panel={panelVNode}
          multiple={false}
          onClear={this.handleClear}
          onPopupVisibleChange={this.handlePopupVisibleChange}
          prefixIcon={prefixIconNode}
          suffixIcon={suffixIconNode}
        />
      </div>
    );
  }
}
