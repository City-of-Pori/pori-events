import React, { useState, useEffect } from 'react'
import { EuiTitle, EuiDatePickerRange, EuiDatePicker } from '@elastic/eui'
import { useSearchkit } from '@searchkit/client'
import moment from "moment";
import "moment/locale/fi"; // without this line it didn't work
moment.locale("es");

export const DateRangeFacetPicker = ({ facet, loading }) => {
  if (!facet) {
    return null;
}
  const api = useSearchkit()
  const moment = require('moment'); // Faced with some issues using import statement

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const selectedOptions = api.getFiltersByIdentifier(facet.identifier)
  const selectedOption = selectedOptions && selectedOptions[0]
  
  useEffect(() => {
    if (startDate && endDate) {
      if (selectedOption) {
        api.removeFilter(selectedOption)
      }
      api.addFilter({
        identifier: facet.identifier,
        dateMin: startDate.toISOString(),
        dateMax: endDate.toISOString(),
      })
      api.search()
    }
  }, [startDate, endDate])

  useEffect(() => {
    const rootPaths = ['/', '/harrastukset/', '/harrastukset']
    if (rootPaths.includes(window.location.pathname) && !window.location.search) {
      setStartDate(moment().startOf('day'))
      setEndDate(moment().startOf('day').add(6, 'days'))
    }
  }, [window.location.pathname])


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
            locale="fi-FI"
            dateFormat={'DD.MM.YYYY'}
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
            locale="fi-FI"
            dateFormat={'DD.MM.YYYY'}
          />
        }
      />
    </>
  )
}

// DateRangeFacet.DISPLAY = 'DateRangeFacet'

export default DateRangeFacetPicker;