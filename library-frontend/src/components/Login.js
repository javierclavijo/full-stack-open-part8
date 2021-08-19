import React, {useEffect, useState} from 'react'
import {useMutation} from "@apollo/client";
import {LOGIN} from "../queries";

const Login = (props) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
            setTimeout(() => setError(''), 5000)
        }
    })

    const handleLogin = (event) => {
        event.preventDefault()
        login({variables: {username, password}}).then(() => {
            setUsername('')
            setPassword('')
        })
    }

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            props.setToken(token)
            localStorage.setItem('library-user-token', token)
        }
    }, [result.data])

    if (!props.show) {
        return null
    }

    return <div>
        {error
            ? <p>{error}</p>
            : null
        }
        <form onSubmit={handleLogin}>
            <div>
                Username
                <input type="text"
                       value={username}
                       onChange={(event) => setUsername(event.target.value)}/>
            </div>
            <div>
                Password
                <input type="password"
                       value={password}
                       onChange={(event) => setPassword(event.target.value)}/>
            </div>
            <button type="submit">Log in</button>
        </form>
    </div>
}

export default Login