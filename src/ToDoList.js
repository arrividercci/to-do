import React, {useEffect, useState} from 'react';
import './ToDoList.css'
import * as signalR from '@microsoft/signalr'

const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7092/todos')
  .build();
  console.log(connection.state);
  await connection.start();

  console.log(connection.state);

const ToDoList = () => {
    const data = JSON.parse(localStorage.getItem("todos")) != null ? JSON.parse(localStorage.getItem("todos")): [];
    const [todos, setTodos] = useState(data);
    const [newTodo, setNewTodo] = useState("");

    useEffect(() => {
        if (connection.state === signalR.HubConnectionState.Connected){
        connection.on('Send', (message) => {
          const newTodos = JSON.parse(message) != null ? JSON.parse(message) : [];    
          setTodos(newTodos);
        });}
      }, []);

    const handleAddTodo = () => {
        if (newTodo.trim() !== ""){
            const newTodos = [...todos, { text: newTodo.trim(), checked: false }];
            setNewTodo("");
            connection.invoke('Send', JSON.stringify(newTodos));
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('index', index);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, newIndex) => {
        e.preventDefault();
        const oldIndex = e.dataTransfer.getData('index');
        const updatedItems = [...todos];
        const [draggedItem] = updatedItems.splice(oldIndex, 1);
        updatedItems.splice(newIndex, 0, draggedItem);
        if (connection.state === signalR.HubConnectionState.Connected) connection.invoke('Send', JSON.stringify(updatedItems));
        localStorage.setItem("todos", JSON.stringify(updatedItems));
      };

    const handleDeleteTodo = (index) => {
        const newTodos = [...todos];
        newTodos.splice(index, 1);
        if (connection.state === signalR.HubConnectionState.Connected) connection.invoke('Send', JSON.stringify(newTodos));
        localStorage.setItem("todos", JSON.stringify(newTodos));
    };

    const handleTogleTodo = (index) => {
        const newTodos = [...todos];
        newTodos[index].checked = !newTodos[index].checked;
        if (connection.state === signalR.HubConnectionState.Connected) connection.invoke('Send', JSON.stringify(newTodos));
        localStorage.setItem("todos", JSON.stringify(newTodos)); 
    };

    return (
        <div className='todos'>
            <h1 style={{margin: "0 auto"}}>To do list.</h1>
            <input type='text' value={newTodo} onChange={(e) => setNewTodo(e.target.value)}/>
            <button onClick={handleAddTodo}>Add</button>
            <ul>
                {todos.map((todo, index) => (
                    <li key={index} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                        <input type='checkbox' checked={todo.checked} onChange={() => handleTogleTodo(index)}/>
                        <span style={{marginRight: "10px", textDecoration: todo.checked ? "line-through" : "none"}}>{todo.text}</span>
                        <button onClick={() => handleDeleteTodo(index)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}



export default ToDoList;