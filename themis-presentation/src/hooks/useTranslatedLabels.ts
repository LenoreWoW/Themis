import { useTranslation } from 'react-i18next';

/**
 * A custom hook that provides translated labels for common UI elements
 */
export const useTranslatedLabels = () => {
  const { t } = useTranslation();
  
  return {
    // Button labels
    buttons: {
      submit: t('common.submit'),
      save: t('common.save'),
      cancel: t('common.cancel'),
      delete: t('common.delete'),
      edit: t('common.edit'),
      add: t('common.add'),
      create: t('common.create'),
      update: t('common.update'),
      close: t('common.close'),
      next: t('common.next'),
      previous: t('common.previous'),
      back: t('common.back'),
      approve: t('common.approve'),
      reject: t('common.reject'),
      yes: t('common.yes'),
      no: t('common.no'),
      ok: t('common.ok'),
      apply: t('common.apply'),
      confirm: t('common.confirm'),
      select: t('common.select'),
      proceed: t('common.proceed'),
      continue: t('common.continue'),
      attach: t('common.attach'),
      upload: t('common.upload'),
      download: t('common.download'),
      refresh: t('common.refresh')
    },
    
    // Common status labels
    status: {
      planning: t('status.planning'),
      inProgress: t('status.inProgress'),
      onHold: t('status.onHold'),
      completed: t('status.completed'),
      cancelled: t('status.cancelled')
    },
    
    // Priority labels
    priority: {
      low: t('priority.low'),
      medium: t('priority.medium'),
      high: t('priority.high'),
      critical: t('priority.critical')
    },
    
    // Common form labels
    form: {
      required: '* مطلوب', // For Arabic
      name: t('common.name'),
      description: t('common.description'),
      startDate: t('common.startDate'),
      endDate: t('common.endDate'),
      search: t('common.search'),
      filter: t('common.filter')
    }
  };
};

export default useTranslatedLabels; 