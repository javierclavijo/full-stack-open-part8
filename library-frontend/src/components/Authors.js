import React, {useEffect, useState} from 'react'
import {useMutation, useQuery} from "@apollo/client";
import {ADD_BOOK, ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR} from "../queries";

const Authors = (props) => {
    const result = useQuery(ALL_AUTHORS)
    const [authors, setAuthors] = useState([])
    const [name, setName] = useState('')
    const [born, setBorn] = useState('')

    const [notification, setNotification] = useState('')
    const [editAuthor] = useMutation(EDIT_AUTHOR, {
        refetchQueries: [{query: ALL_AUTHORS}],
        onError: (e) => {
            const errorMessage = e.graphQLErrors[0] ? e.graphQLErrors[0] : e.message
            setNotification(errorMessage)
            setTimeout(() => setNotification(''), 5000)
        }
    })

    useEffect(() => {
        if (result.data) {
            setAuthors(result.data.allAuthors)
        }
    }, [result])

    if (result.loading) {
        return <div>Loading...</div>
    }

    if (!props.show) {
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await editAuthor({
            variables: {name, setBornTo: Number(born)}
        })
        setName('')
        setBorn('')
    }

    return (
        <div>
            {notification
                ? <div style={{color: "red"}}>{notification}</div>
                : null
            }
            <h2>authors</h2>
            <table>
                <tbody>
                <tr>
                    <th></th>
                    <th>
                        born
                    </th>
                    <th>
                        books
                    </th>
                </tr>
                {authors.map(a =>
                    <tr key={a.name}>
                        <td>{a.name}</td>
                        <td>{a.born}</td>
                        <td>{a.bookCount}</td>
                    </tr>
                )}
                </tbody>
            </table>

            <h3>Add an author</h3>
            <form onSubmit={handleSubmit}>
                <label>Name
                    <input type="text"
                           name="name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           required
                    />
                </label>
                <label>Born
                    <input type="text"
                           name="born"
                           value={born}
                           onChange={(e) => setBorn(e.target.value)}
                           required
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Authors
