import { useSearchkit } from '@searchkit/client'
import { EuiButtonEmpty } from '@elastic/eui'
import React from 'react'

export const ResetSearchButton = ({ loading }) => {
  const api = useSearchkit()

  return (
    <EuiButtonEmpty
      disabled={!api.canResetSearch()}
      isLoading={loading}
      onClick={() => {
        api.setQuery('');
        const currentFilters = api.getFilters()
        const currentEventType = currentFilters?.find((filter) => filter.identifier === 'is_hobby')
        if(currentEventType) {
            api.addFilter(currentEventType)
        }
        api.search();
      }}
    >
      {Drupal.t("Reset all filters")}
    </EuiButtonEmpty>
  )
}
