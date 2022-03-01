import React, { useCallback, useMemo } from 'react';

import useSettings from 'hooks/useSettings';
import TrialInfoBox from 'pages/TrialDetails/TrialInfoBox';
import { ExperimentBase, MetricName, MetricType, TrialDetails, WorkloadGroup } from 'types';
import { extractMetricNames } from 'utils/metric';

import TrialChart from './TrialChart';
import css from './TrialDetailsOverview.module.scss';
import settingsConfig, { Settings } from './TrialDetailsOverview.settings';
import TrialDetailsWorkloads from './TrialDetailsWorkloads';

export interface Props {
  experiment: ExperimentBase;
  trial: TrialDetails;
  workloads: WorkloadGroup[];
}

const TrialDetailsOverview: React.FC<Props> = ({ experiment, trial, workloads }: Props) => {
  const storagePath = `trial-detail/experiment/${experiment.id}`;
  const {
    settings,
    updateSettings,
  } = useSettings<Settings>(settingsConfig, { storagePath });

  const { defaultMetrics, metricNames, metrics } = useMemo(() => {
    const validationMetric = experiment?.config?.searcher.metric;
    const metricNames = extractMetricNames(workloads || []);
    const defaultValidationMetric = metricNames.find(metricName => (
      metricName.name === validationMetric && metricName.type === MetricType.Validation
    ));
    const fallbackMetric = metricNames && metricNames.length !== 0 ? metricNames[0] : undefined;
    const defaultMetric = defaultValidationMetric || fallbackMetric;
    const defaultMetrics = defaultMetric ? [ defaultMetric ] : [];
    const settingMetrics: MetricName[] = (settings.metric || []).map(metric => {
      const splitMetric = metric.split('|');
      return { name: splitMetric[1], type: splitMetric[0] as MetricType };
    });
    const metrics = settingMetrics.length !== 0 ? settingMetrics : defaultMetrics;
    return { defaultMetrics, metricNames, metrics };
  }, [ experiment?.config?.searcher, settings.metric, workloads ]);

  const handleMetricChange = useCallback((value: MetricName[]) => {
    const newMetrics = value.map(metricName => `${metricName.type}|${metricName.name}`);
    updateSettings({ metric: newMetrics, tableOffset: 0 });
  }, [ updateSettings ]);

  return (
    <div className={css.base}>
      <TrialInfoBox experiment={experiment} trial={trial} workloads={workloads} />
      <TrialChart
        defaultMetricNames={defaultMetrics}
        metricNames={metricNames}
        metrics={metrics}
        workloads={workloads}
        onMetricChange={handleMetricChange}
      />
      <TrialDetailsWorkloads
        defaultMetrics={defaultMetrics}
        experiment={experiment}
        metricNames={metricNames}
        metrics={metrics}
        settings={settings}
        trial={trial}
        updateSettings={updateSettings}
        workloads={workloads}
      />
    </div>
  );
};

export default TrialDetailsOverview;
