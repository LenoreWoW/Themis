declare module 'react-gantt-timeline' {
  import { ComponentType } from 'react';

  export interface TimelineMode {
    day: boolean;
    week: boolean;
    month: boolean;
    year: boolean;
  }

  export interface GanttLink {
    id: string;
    start: string;
    end: string;
  }

  export interface GanttTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
    color?: string;
    isDisabled?: boolean;
    classes?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export interface DateHelper {
    dateToPixel: (input: Date) => number;
    pixelToDate: (input: number) => Date;
    getDateString: (input: Date) => string;
  }

  export interface SizeHelper {
    getTaskPosition: (task: GanttTask) => { x: number; y: number; width: number; height: number };
    getTaskSize: (task: GanttTask) => { width: number; height: number };
  }

  export interface Scroll {
    timeLineHeight: number;
    scrollTop: number;
    scrollLeft: number;
  }

  export interface Config {
    header: {
      top: {
        style: React.CSSProperties;
        format: string;
      };
      middle: {
        style: React.CSSProperties;
        format: string;
      };
      bottom: {
        style: React.CSSProperties;
        format: string;
      };
    };
    taskList: {
      title: {
        label: string;
        style: React.CSSProperties;
      };
      task: {
        style: React.CSSProperties;
      };
      verticalSeparator: {
        style: React.CSSProperties;
        enable: boolean;
      };
    };
    dataViewPort: {
      rows: {
        style: React.CSSProperties;
      };
      task: {
        showLabel: boolean;
        style: React.CSSProperties;
      };
    };
    links: {
      color: string;
      selectedColor: string;
    };
  }

  export interface TaskStyleFunction {
    (task: GanttTask): React.CSSProperties;
  }

  export interface TimelineProps {
    mode?: 'day' | 'week' | 'month' | 'year';
    itemHeight?: number;
    lineHeight?: number;
    data: GanttTask[];
    links?: GanttLink[];
    selectedItem?: string;
    selectedItems?: string[];
    nonWorkingDays?: number[];
    nonWorkingTime?: {
      hour: number;
      minute: number;
      second: number;
    }[];
    dateFormat?: string;
    dayFormat?: string;
    monthFormat?: string;
    config?: Config;
    onSelectItem?: (item: GanttTask) => void;
    onUpdateTask?: (item: GanttTask, props: object) => void;
    onCreateLink?: (link: GanttLink) => void;
    onCreateItem?: (task: GanttTask) => void;
    onDoubleClickItem?: (task: GanttTask) => void;
    onTaskClick?: (task: GanttTask) => void;
    onTaskMove?: (task: GanttTask, start: Date, end: Date) => void;
    onTaskResize?: (task: GanttTask, start: Date, end: Date) => void;
    onZoom?: (mode: TimelineMode, startDate: Date, endDate: Date) => void;
    onHorizontalScroll?: (start: Date, end: Date) => void;
    onVerticalScroll?: (scrollTop: number) => void;
    onExpanderClick?: (task: GanttTask) => void;
    width?: number;
    height?: number;
    timeLineWidth?: number;
    scrollLeft?: number;
    scrollTop?: number;
    stickyOffset?: number;
    timeStart?: Date;
    timeEnd?: Date;
    arrowColor?: string;
    rtl?: boolean;
    showTaskList?: boolean;
    style?: React.CSSProperties;
    taskListWidth?: number;
    taskListColumnWidth?: number;
    locale?: string;
    rowsHeight?: number;
    ganttHeight?: number;
    rowPadding?: number;
    todayColor?: string;
    enableDrag?: boolean;
    enableResize?: boolean;
    enableSticky?: boolean;
    getTaskStyle?: TaskStyleFunction;
    calculateDateByPosition?: (x: number) => Date;
    calculatePositionByDate?: (date: Date) => number;
  }

  declare const Timeline: ComponentType<TimelineProps>;
  export default Timeline;
} 