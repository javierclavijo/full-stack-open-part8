import React, {useEffect, useState} from 'react'
import {useLazyQuery, useQuery} from "@apollo/client";
import {ALL_BOOKS, ME, RECOMMENDATIONS} from "../queries";

const Recommendations = (props) => {
    const [user, setUser] = useState(null)
    const [queryBooks, result] = useLazyQuery(RECOMMENDATIONS)
    const [books, setBooks] = useState([])
    const userResult = useQuery(ME)

    useEffect(() => {
        if (result.data) {
            setBooks(result.data.allBooks)
        }
    }, [result])

    useEffect(() => {
        if (userResult.data) {
            setUser(userResult.data.me)
            queryBooks({variables: {$genre: userResult.data.me.favoriteGenre}})
        }
    }, [userResult])

    if (result.loading) {
        return <div>Loading...</div>
    }

    if (!props.show || !user) {
        return null
    }

    return (
        <div>
            <h2>Recommendations</h2>
            <p>Books in your favourite genre: {user.favoriteGenre}</p>
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
                {books.map(a => <tr key={a.title}>
                        <td>{a.title}</td>
                        <td>{a.author.name}</td>
                        <td>{a.published}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}

export default Recommendations