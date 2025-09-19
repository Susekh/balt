'use client';
import React, { useState } from 'react';
import { columns } from '../components/student-data-column';
import { DataTable } from '@/components/data-table-components/data-table';
import { DataTableToolbar } from '@/components/data-table-components/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTableFilterField, StudentResultTable } from '../../../../types';
import { diploma_colleges } from '@/misc/list-of-colleges';


const StudentDataTable = ({data}: {data: StudentResultTable[]}) => {
  const [visible, setVisible] = useState<boolean>(data ? true: false);
  const marks = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 'N/A']

  const filterFields: DataTableFilterField<StudentResultTable>[] = [
    {
      id: 'collegeName',
      label: 'Colleges',
      options: diploma_colleges.map((college) => ({
        value: college,
        label: college,
      })),
    },
    {
      id: 'score',
      label: 'Secured Mark',
      options: marks.map((mark) => ({
        value: mark,
        label: mark,
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns
  });

  return (
    <div className="container mx-auto w-full">
        {visible && data?.length > 0 ? (
          <DataTable table={table}>
            <DataTableToolbar
              fileName="Odsic-Data"
              filterFields={filterFields}
              table={table}
            />
          </DataTable>
        ) : (
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            Unable to fetch data!
          </div>
        )}
    </div>
  );
};

export default StudentDataTable;