import React, { useState, useEffect } from 'react'
import { EuiTitle, EuiDatePickerRange, EuiDatePicker } from '@elastic/eui'
import { useSearchkit } from '@searchkit/client'

export const DateRangeFacetPicker = ({ facet, loading }) => {
  if (!facet) {
    return null;
}
  const api = useSearchkit()
  const moment = require('moment'); // Faced with some issues using import statement

  // const [startDate, setStartDate] = useState(moment())
  // const [endDate, setEndDate] = useState(moment().add(6, 'days'))


  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const selectedOptions = api.getFiltersByIdentifier(facet.identifier)
  const selectedOption = selectedOptions && selectedOptions[0]

  // console.log('startDate', startDate.format('YYYY-MM-DD'))

  useEffect(() => {
    if (startDate && endDate) {
      if (selectedOption) {
        api.removeFilter(selectedOption)
      }
      api.addFilter({
        identifier: facet.identifier,
        dateMin: startDate.format('YYYY-MM-DD'),
        dateMax: endDate.format('YYYY-MM-DD'),
      })
      api.search()
    }
  }, [startDate, endDate])

  return (
    <>
      <EuiTitle size="xxs">
        <h3>{Drupal.t('Date')}</h3>
      </EuiTitle>
      <EuiDatePickerRange
        startDateControl={
          <EuiDatePicker
            isLoading={loading}
            selected={startDate}
            onChange={setStartDate}
            startDate={startDate}
            value={selectedOption && selectedOption.dateMin}
            endDate={endDate}
            adjustDateOnChange={false}
            placeholder="alkaa"
            isInvalid={startDate > endDate}
            aria-label="Start date"
          />
        }
        endDateControl={
          <EuiDatePicker
            isLoading={loading}
            selected={endDate}
            onChange={setEndDate}
            startDate={startDate}
            value={selectedOption && selectedOption.dateMax}
            endDate={endDate}
            adjustDateOnChange={false}
            isInvalid={startDate > endDate}
            aria-label="End date"
            placeholder="loppuu"
          />
        }
      />
    </>
  )
}

// DateRangeFacet.DISPLAY = 'DateRangeFacet'

export default DateRangeFacetPicker;