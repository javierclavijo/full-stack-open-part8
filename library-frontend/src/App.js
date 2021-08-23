import React, {useEffect, useState} from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from "./components/Login";
import {useApolloClient, useMutation} from "@apollo/client";
import {LOGIN} from "./queries";
import Recommendations from "./components/Recommendations";

const App = () => {
    const [page, setPage] = useState('recommendations')
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const client = useApolloClient()

    useEffect(() => {
        const token = localStorage.getItem('library-user-token')
        if (token) {
            setToken(token)
        }
    }, [])

    function handleLogout() {
        setToken(null)
        localStorage.clear()
        client.resetStore()
    }

    if (token && page === 'login') {
        setPage('authors')
    } else if (!token && (page === 'add' || page === 'recommendations')) {
        setPage('login')
    }

    return (
        <div>
            <div>
                <button onClick={() => setPage('authors')}>authors</button>
                <button onClick={() => setPage('books')}>books</button>

                {token == null
                    ? <button onClick={() => setPage('login')}>login</button>
                    : <div>
                        <button onClick={() => setPage('add')}>add book</button>
                        <button onClick={() => setPage('recommendations')}>recommendations</button>
                        <button onClick={handleLogout}>logout</button>
                    </div>
                }
            </div>

            <Authors
                show={page === 'authors'}
            />

            <Books
                show={page === 'books'}
            />

            <NewBook
                show={page === 'add'}
            />

            <Login
                show={page === 'login'}
                setToken={setToken}
            />

            <Recommendations
                show={page === 'recommendations'}
            />

        </div>
    )
}

export default App