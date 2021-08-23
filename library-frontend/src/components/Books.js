import React, {useEffect, useState} from 'react'
import {useQuery} from "@apollo/client";
import {ALL_BOOKS} from "../queries";

const Books = (props) => {
    const result = useQuery(ALL_BOOKS, {pollInterval: 5000})
    const [books, setBooks] = useState([])
    const [filter, setFilter] = useState('')
    const [genres, setGenres] = useState([])

    useEffect(() => {
        if (result.data) {
            setBooks(result.data.allBooks)
            setGenres(Array.from(new Set(result.data.allBooks.flatMap(b => b.genres))))
        }
    }, [result])

    if (result.loading) {
        return <div>Loading...</div>
    }

    if (!props.show) {
        return null
    }

    return (
        <div>
            <h2>books</h2>

            <table>
                <tbody>
                <tr>
                    <th></th>
                    <th>
                        author
                    </th>
                    <th>
                        published
                    </th>
                </tr>
                {books.map(a =>
                    !filter || a.genres.includes(filter)
                        ? <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                        : null
                )}
                </tbody>
            </table>

            <div>
                <h4>Filter by genre</h4>
                <select
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value)
                        result.refetch()
                    }}>
                    <option value="">No filter</option>
                    {(genres.map(genre =>
                        <option value={genre}>{genre}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default Books