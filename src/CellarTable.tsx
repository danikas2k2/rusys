import {
    Box,
    Checkbox,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CellarToolbar } from '~/CellarToolbar';
import { initialLoadAction } from '~/store/base.actions';
import { BaseState } from '~/store/base.types';
import { cmp } from '~/utils';
import { ValueRow } from '~/ValueRow';
import './CellarTable.css';

export default function CellarTable() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loading && !loaded) {
            setLoading(true);
            dispatch(
                initialLoadAction(() => {
                    setLoaded(true);
                    setLoading(false);
                })
            );
        }
    }, [loading, loaded, dispatch]);

    const [missing, years, details] = useSelector(
        (state: BaseState) => [state.missing, state.years, state.details] as const
    );
    const [missingOnly, setMissingOnly] = useState<boolean>(false);
    const hasMissing = !!missing.length;

    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    if (!years?.length && !details?.length) {
        return (
            <Box className="ProgressBox">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="CellarBox">
            <CellarToolbar />
            <TableContainer className="CellarContainer">
                <Table stickyHeader size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" onClick={() => hasMissing && setMissingOnly(!missingOnly)}>
                                <Checkbox color="primary" checked={!missingOnly} disabled={!hasMissing} />
                            </TableCell>
                            <TableCell />
                            {years.map((year) => (
                                <TableCell key={year} align="center">
                                    {year}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(details)
                            .sort(([a], [b]) => cmp(a.toLowerCase(), b.toLowerCase()))
                            .map(([name, values]) => {
                                const isMissing = missing.includes(name);
                                return (
                                    (!missingOnly || isMissing) && (
                                        <ValueRow key={name} name={name} values={values} isMissing={isMissing} />
                                    )
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
