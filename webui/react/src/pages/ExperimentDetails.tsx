import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { ContinueTrialHandles } from 'components/ContinueTrial';
import CreateExperimentModal, { CreateExperimentType } from 'components/CreateExperimentModal';
import Message, { MessageType } from 'components/Message';
import Page from 'components/Page';
import Spinner from 'components/Spinner';
import usePolling from 'hooks/usePolling';
import ExperimentDetailsHeader from 'pages/ExperimentDetails/ExperimentDetailsHeader';
import { paths, routeToReactUrl } from 'routes/utils';
import {
  getExperimentDetails, getExpValidationHistory, isNotFound,
} from 'services/api';
import { createExperiment } from 'services/api';
import { isAborted } from 'services/utils';
import { ExperimentBase, RawJson, ValidationHistory } from 'types';
import { clone, isEqual } from 'utils/data';
import { isSingleTrialExperiment } from 'utils/experiment';
import { terminalRunStates, upgradeConfig } from 'utils/types';

import ExperimentMultiTrialTabs from './ExperimentDetails/ExperimentMultiTrialTabs';
import ExperimentSingleTrialTabs from './ExperimentDetails/ExperimentSingleTrialTabs';

interface Params {
  experimentId: string;
}

const ExperimentDetails: React.FC = () => {
  const { experimentId } = useParams<Params>();
  const [ canceler ] = useState(new AbortController());
  const [ experiment, setExperiment ] = useState<ExperimentBase>();
  const [ valHistory, setValHistory ] = useState<ValidationHistory[]>([]);
  const [ pageError, setPageError ] = useState<Error>();
  const [ forkModalConfig, setForkModalConfig ] = useState<RawJson>();
  const [ forkModalError, setForkModalError ] = useState<string>();
  const [ isForkModalVisible, setIsForkModalVisible ] = useState(false);
  const [ isSingleTrial, setIsSingleTrial ] = useState<boolean>();
  const continueTrialRef = useRef<ContinueTrialHandles>(null);

  const id = parseInt(experimentId);

  const fetchExperimentDetails = useCallback(async () => {
    try {
      const [ experimentData, validationHistory ] = await Promise.all([
        getExperimentDetails({ id }, { signal: canceler.signal }),
        getExpValidationHistory({ id }, { signal: canceler.signal }),
      ]);
      if (!isEqual(experimentData, experiment)) setExperiment(experimentData);
      if (!isEqual(validationHistory, valHistory)) setValHistory(validationHistory);
      setIsSingleTrial(
        isSingleTrialExperiment(experimentData),
      );
    } catch (e) {
      if (!pageError && !isAborted(e)) setPageError(e);
    }
  }, [
    experiment,
    id,
    canceler.signal,
    pageError,
    valHistory,
  ]);

  const { stopPolling } = usePolling(fetchExperimentDetails);

  const showForkModal = useCallback((): void => {
    if (experiment?.configRaw) {
      const rawConfig: RawJson = clone(experiment.configRaw);
      if (rawConfig.description) rawConfig.description = `Fork of ${rawConfig.description}`;
      upgradeConfig(rawConfig);
      setForkModalConfig(rawConfig);
    }
    setIsForkModalVisible(true);
  }, [ experiment?.configRaw ]);

  const showContinueTrial = useCallback((): void => {
    continueTrialRef.current?.show();
  }, [ continueTrialRef ]);

  const handleForkModalCancel = useCallback(() => {
    setIsForkModalVisible(false);
  }, []);

  const handleForkModalSubmit = useCallback(async (newConfig: string) => {
    try {
      const { id: configId } = await createExperiment({
        experimentConfig: newConfig,
        parentId: id,
      });

      setIsForkModalVisible(false);

      // Route to reload path to forcibly remount experiment page.
      const newPath = paths.experimentDetails(configId);
      routeToReactUrl(paths.reload(newPath));
    } catch (e) {
      let errorMessage = 'Unable to fork experiment with the provided config.';
      if (e.name === 'YAMLException') {
        errorMessage = e.message;
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.json) {
        const errorJSON = await e.json();
        errorMessage = errorJSON.error?.error;
      }
      setForkModalError(errorMessage);
    }
  }, [ id ]);

  useEffect(() => {
    if (experiment && terminalRunStates.has(experiment.state)) {
      stopPolling();
    }
  }, [ experiment, stopPolling ]);

  useEffect(() => {
    return () => canceler.abort();
  }, [ canceler ]);

  if (isNaN(id)) {
    return <Message title={`Invalid Experiment ID ${experimentId}`} />;
  } else if (pageError) {
    const message = isNotFound(pageError) ?
      `Unable to find Experiment ${experimentId}` :
      `Unable to fetch Experiment ${experimentId}`;
    return <Message title={message} type={MessageType.Warning} />;
  } else if (!experiment || isSingleTrial === undefined) {
    return <Spinner tip={`Loading experiment ${experimentId} details...`} />;
  }

  return (
    <Page
      headerComponent={<ExperimentDetailsHeader
        experiment={experiment}
        fetchExperimentDetails={fetchExperimentDetails}
        isSingleTrial={isSingleTrial}
        showContinueTrial={showContinueTrial}
        showForkModal={showForkModal}
      />}
      stickyHeader
      title={`Experiment ${experimentId}`}>
      {isSingleTrial ? (
        <ExperimentSingleTrialTabs
          continueTrialRef={continueTrialRef}
          experiment={experiment}
        />
      ) : (
        <ExperimentMultiTrialTabs experiment={experiment} />
      )}
      <CreateExperimentModal
        config={forkModalConfig}
        error={forkModalError}
        title={`Fork Experiment ${id}`}
        type={CreateExperimentType.Fork}
        visible={isForkModalVisible}
        onCancel={handleForkModalCancel}
        onOk={handleForkModalSubmit}
      />
    </Page>
  );
};

export default ExperimentDetails;
