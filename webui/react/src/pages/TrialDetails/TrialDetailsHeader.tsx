import React, { useCallback, useMemo, useState } from 'react';

import Icon from 'components/Icon';
import PageHeaderFoldable, { Option } from 'components/PageHeaderFoldable';
import { terminalRunStates } from 'constants/states';
import useCreateExperimentModal, {
  CreateExperimentType,
} from 'hooks/useModal/useModalExperimentCreate';
import TrialHeaderLeft from 'pages/TrialDetails/Header/TrialHeaderLeft';
import { openOrCreateTensorBoard } from 'services/api';
import { getStateColorCssVar } from 'themes';
import { ExperimentAction as Action, ExperimentBase, TrialDetails, WorkloadGroup } from 'types';
import { getWorkload, isMetricsWorkload } from 'utils/workload';
import { openCommand } from 'wait';

export const trialWillNeverHaveData = (
  trial: TrialDetails,
  workloads: WorkloadGroup[],
): boolean => {
  const isTerminal = terminalRunStates.has(trial.state);
  const workloadsWithSomeMetric = workloads
    .map(getWorkload)
    .filter(workload => isMetricsWorkload(workload) && !!workload.metrics);
  return isTerminal && workloadsWithSomeMetric.length === 0;
};

interface Props {
  experiment: ExperimentBase;
  fetchTrialDetails: () => void;
  trial: TrialDetails;
  workloads: WorkloadGroup[];
}

const TrialDetailsHeader: React.FC<Props> = ({
  experiment,
  fetchTrialDetails,
  trial,
  workloads,
}: Props) => {
  const [ isRunningTensorBoard, setIsRunningTensorBoard ] = useState<boolean>(false);

  const handleModalClose = useCallback(() => fetchTrialDetails(), [ fetchTrialDetails ]);

  const { modalOpen } = useCreateExperimentModal({ onClose: handleModalClose });

  const handleContinueTrial = useCallback(() => {
    modalOpen({ experiment, trial, type: CreateExperimentType.ContinueTrial });
  }, [ experiment, modalOpen, trial ]);

  const headerOptions = useMemo<Option[]>(() => {
    const options: Option[] = [];

    if (!trialWillNeverHaveData(trial, workloads)) {
      options.push({
        icon: <Icon name="tensor-board" size="small" />,
        isLoading: isRunningTensorBoard,
        key: Action.OpenTensorBoard,
        label: 'TensorBoard',
        onClick: async () => {
          setIsRunningTensorBoard(true);
          const tensorboard = await openOrCreateTensorBoard({ trialIds: [ trial.id ] });
          openCommand(tensorboard);
          await fetchTrialDetails();
          setIsRunningTensorBoard(false);
        },
      });
    }

    if (trial.bestAvailableCheckpoint !== undefined) {
      options.push({
        icon: <Icon name="fork" size="small" />,
        key: Action.ContinueTrial,
        label: 'Continue Trial',
        onClick: handleContinueTrial,
      });
    } else {
      options.push({
        icon: <Icon name="fork" size="small" />,
        key: Action.ContinueTrial,
        label: 'Continue Trial',
        tooltip: 'No checkpoints found. Cannot continue trial',
      });
    }

    return options;
  }, [
    fetchTrialDetails,
    handleContinueTrial,
    isRunningTensorBoard,
    trial,
    workloads,
  ]);

  return (
    <PageHeaderFoldable
      leftContent={<TrialHeaderLeft experiment={experiment} trial={trial} />}
      options={headerOptions}
      style={{ backgroundColor: getStateColorCssVar(trial.state) }}
    />
  );
};

export default TrialDetailsHeader;
