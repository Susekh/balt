'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table-components/data-table-column-header';
import { StudentResultTable } from '../../../../types';
import { diploma_colleges } from '@/misc/list-of-colleges';

const marks = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 'N/A']
let i = 0

export const columns: ColumnDef<StudentResultTable>[] = [
  {
    accessorKey: 'slNo',
    header: () => <div className="">Sl No</div>,
    cell: ({ row }) => <div className="">{row.getValue('slNo')}</div>,
  },
  {
    accessorKey: 'email',
    header: () => <div className="">Email</div>,
    cell: ({ row }) => <div className="">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'collegeName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="College Name" />
    ),
    cell: ({ row }) => {
      const clg = diploma_colleges.find(
        (type) => type === row.getValue('collegeName'),
      );

      if (!clg) {
        return null;
      }

      return (
        <div className="flex items-center">
          <span>{clg}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'name',
    header: () => <div className="">Name</div>,
    cell: ({ row }) => <div className="">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'branch',
    header: () => <div className="">Branch</div>,
    cell: ({ row }) => <div className="">{row.getValue('branch')}</div>,
  },
  {
    accessorKey: 'semester',
    header: () => <div className="">Semester</div>,
    cell: ({ row }) => <div className="">{row.getValue('semester')}</div>,
  },
  {
    accessorKey: 'contactNo',
    header: () => <div className="">Contact No.</div>,
    cell: ({ row }) => <div className="">{row.getValue('contactNo')}</div>,
  },
  {
    accessorKey: 'score',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Secured Mark" />
    ),
    cell: ({ row }) => {
      const mark = marks.find(
        (mark) => mark === row.getValue('score'),
      );

      if (!mark) {
        return null;
      }

      return (
        <div className="flex items-center">
          <span>{mark}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'total',
    header: () => <div className="">Total Mark</div>,
    cell: ({ row }) => <div className="">{row.getValue('total')}</div>,
  }
];