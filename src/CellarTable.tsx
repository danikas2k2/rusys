import { api } from '@config';
import MenuIcon from '@mui/icons-material/Menu';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import deepEqual from 'deep-equal';
import isEmpty from 'is-empty';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Details, LoadResponse, Value, Values, Year } from '~/types';
import { ValueCell } from '~/ValueCell';

export default function CellarTable() {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [years, setYears] = useState<Year[]>([]);
    const [details, setDetails] = useState<Details>({});
    const [missing, setMissing] = useState<string[]>([]);

    async function load(onLoad: () => void) {
        const response = await fetch(`${api?.href}/load`);
        const result: LoadResponse = await response.json();
        const { years, details, missing } = result || {};
        years && setYears(years);
        details && setDetails(details);
        missing && setMissing(missing);
        onLoad?.();
    }

    useEffect(() => {
        if (!loading && !loaded) {
            setLoading(true);
            (async () => {
                await load(() => {
                    setLoaded(true);
                    setLoading(false);
                });
            })();
        }
    }, [loading, loaded]);

    async function saveMissing(missing: string[]) {
        const response = await fetch(`${api?.href}/setMissing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missing }),
        });
        const { missing: newMissing } = (await response.json()) || {};
        if (!deepEqual(missing, newMissing)) {
            setMissing(newMissing);
        }
    }

    const handleSelection = (name: string, isMissing: boolean) => {
        const missingIndex = missing.indexOf(name);
        let newMissing: string[] = [...missing];
        if (isMissing) {
            if (missingIndex < 0) {
                newMissing.push(name);
            }
        } else if (missingIndex >= 0) {
            newMissing.splice(missingIndex, 1);
        }
        setMissing(newMissing);
        (async () => {
            await saveMissing(newMissing);
        })();
    };

    async function saveDetails(name: string, details: Details) {
        const response = await fetch(`${api?.href}/setDetails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, details: details[name] }),
        });
        const { years: newYears, details: newDetails } = (await response.json()) || {};
        if (!deepEqual(years, newYears)) {
            setYears(newYears);
        }
        if (!deepEqual(details, newDetails)) {
            setDetails(newDetails);
            handleSelection(name, false);
        }
    }

    const handleValue = (name: string, year: Year, value?: Value) => {
        const newValues: Values = { ...(details[name] || {}) };
        if (!value || isEmpty(value)) {
            delete newValues[year];
        } else {
            newValues[year] = value;
        }
        const newDetails = { ...details };
        newDetails[name] = newValues;
        setDetails(newDetails);
        handleSelection(name, false);
        (async () => {
            await saveDetails(name, newDetails);
        })();
    };

    const isMissing = (name: string) => missing.includes(name);

    if (!years?.length && !details?.length) {
        return (
            <Box sx={{ width: '100%', marginTop: '10em' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <TableContainer sx={{ maxHeight: '100vh' }}>
                <Table stickyHeader size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: 'lightgray',
                                }}
                            >
                                <MenuIcon />
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
                                <TableRow
                                    key={name}
                                    role="checkbox"
                                    tabIndex={-1}
                                    aria-checked={!isItemMissing}
                                    selected={isItemMissing}
                                >
                                    <TableCell
                                        padding="checkbox"
                                        onClick={() => isUnavailable || handleSelection(name, !isItemMissing)}
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
                                        onClick={() => isUnavailable || handleSelection(name, !isItemMissing)}
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
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
