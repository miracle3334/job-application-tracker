import React from 'react';

function ApplicationList({applications}) {
  return (
      <div>
        {applications.map(app => (
          <div key={app.id}>
            {app.company} - {app.position} - {app.date_applied} - {app.status} - {app.notes}
          </div>
        ))}
      </div>
  );
}

export default ApplicationList;