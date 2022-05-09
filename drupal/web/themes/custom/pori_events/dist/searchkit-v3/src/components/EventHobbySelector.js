import { useState } from "react";
import { useSearchkitVariables, useSearchkit, FilterLink } from "@searchkit/client";
import { EuiButtonGroup } from '@elastic/eui';

// Component for Event / Hobby switching
export const EventHobbySelector = () => {
    const api = useSearchkit();
  
    const [eventType, setEventType] = useState('event')

    const eventTypes = [
        {
          id: `event`,
          label: 'Event',
        },
        {
          id: `hobby`,
          label: 'Hobby',
        },
      ]

    const eventTypeOnChange = (id) => {
        console.log('id', id)
        if(id === 'hobby') {
            api.removeFiltersByIdentifier('is_hobby');
            api.addFilter({identifier: 'is_hobby', value: true});
            // api.toggleFilter({identifier: 'is_hobby', value: true});
            api.search();
        }
        if(id === 'event') {
            api.removeFiltersByIdentifier('is_hobby');
            api.addFilter({identifier: 'is_hobby', value: false});
            // api.toggleFilter({identifier: 'is_hobby', value: false});
            api.search();
        }
        api.search();
        setEventType(id);
    }

    return (
      <div>
        {/* <a
          onClick={() => {
            api.toggleFilter({identifier: 'type', value: 'test'});
            api.search();
          }}>
          Toggle test filter
        </a> */}
        <EuiButtonGroup
            legend="This is a basic group"
            options={eventTypes}
            idSelected={eventType}
            onChange={(id) => eventTypeOnChange(id)}
          />
      </div>
    );
  };

  export default EventHobbySelector;