declare module 'react-gantt-timeline' {
  interface TimelineTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
    color?: string;
    isDisabled?: boolean;
    [key: string]: any;
  }

  interface TimelineLink {
    id: string;
    start: string;
    end: string;
  }

  interface TimelineProps {
    data: TimelineTask[];
    links?: TimelineLink[];
    mode?: 'year' | 'month' | 'week' | 'day';
    itemHeight?: number;
    nonEditableName?: boolean;
    onItemDoubleClick?: (item: TimelineTask) => void;
    onItemClick?: (item: TimelineTask) => void;
    onUpdateTask?: (item: TimelineTask, props: any) => void;
    onSelectItem?: (item: TimelineTask) => void;
    [key: string]: any;
  }

  const Timeline: React.FC<TimelineProps>;
  
  export default Timeline;
} 