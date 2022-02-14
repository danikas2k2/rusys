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
import { isEmpty } from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CellarToolbar } from '~/CellarToolbar';
import { initialLoadAction } from '~/store/base.actions';
import { BaseState } from '~/store/base.types';
import { setValueAction } from '~/store/details.actions';
import { Value, Year } from '~/store/details.types';
import { addMissingAction, removeMissingAction } from '~/store/missing.actions';
import { ValueCell } from '~/ValueCell';

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
    const isMissing = (name: string) => missing.includes(name);

    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    const handleMissing = (name: string, isMissing: boolean) => {
        if (isMissing) {
            dispatch(addMissingAction(name));
        } else {
            dispatch(removeMissingAction(name));
        }
    };

    const handleValue = (name: string, year: Year, value?: Value) => {
        dispatch(setValueAction(name, year, value));
        handleMissing(name, false);
    };

    if (!years?.length && !details?.length) {
        return (
            <Box sx={{ width: '100%', marginTop: '10em' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <CellarToolbar />
            <TableContainer sx={{ maxHeight: '100vh' }}>
                <Table stickyHeader size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                padding="checkbox"
                                sx={{
                                    backgroundColor: 'lightgray',
                                }}
                                onClick={() => hasMissing && setMissingOnly(!missingOnly)}
                            >
                                <Checkbox color="primary" checked={!missingOnly} disabled={!hasMissing} />
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: 'lightgray',
                                }}
                            />
                            {years.map((year) => (
                                <TableCell
                                    key={year}
                                    align="center"
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: 'lightgray',
                                    }}
                                >
                                    {year}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(details).map(([name, values]) => {
                            const isItemMissing = isMissing(name);
                            const labelId = `enhanced-table-checkbox-name`;
                            const isUnavailable = isEmpty(values);
                            return (
                                (!missingOnly || isItemMissing) && (
                                    <TableRow
                                        key={name}
                                        role="checkbox"
                                        tabIndex={-1}
                                        aria-checked={!isItemMissing}
                                        selected={isItemMissing}
                                    >
                                        <TableCell
                                            padding="checkbox"
                                            onClick={() => isUnavailable || handleMissing(name, !isItemMissing)}
                                        >
                                            <Checkbox
                                                color="primary"
                                                checked={!isItemMissing}
                                                disabled={isUnavailable}
                                                indeterminate={isUnavailable}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                            sx={{ textDecoration: isUnavailable ? 'line-through' : '' }}
                                            onClick={() => isUnavailable || handleMissing(name, !isItemMissing)}
                                        >
                                            {name}
                                        </TableCell>
                                        {years.map((year) => (
                                            <ValueCell
                                                key={year}
                                                value={values[year]}
                                                onChange={(value) => handleValue(name, year, value)}
                                            />
                                        ))}
                                    </TableRow>
                                )
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
