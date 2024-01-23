import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Todo } from './types/Todo';
import { Statuses } from './types/Statuses';
import { createTodo, getTodos, deleteTodo, updateTodos } from './api/requests';
import { TodoItem } from './components/TodoItem/TodoItem';
import { TodoFilter } from './components/TodoFilter/TodoFilter';
import './App.scss';

const USER_ID = 11498;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeFilter, setActiveFilter] = useState(Statuses.ALL);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [wasThereAdding, setWasThereAdding] = useState(false);
  const [areAllCompletedDeleting, setAreAllCompletedDeleting] = useState(false);
  const [areAllToggling, setAreAllToggling] = useState(false);

  let completedTodos: Todo[] = Array.isArray(todos) ? todos.filter(todo => todo.completed) : [];
  let activeTodos: Todo[] = Array.isArray(todos) ? todos.filter(todo => !todo.completed) : [];
  let visibleTodos: Todo[] = [];
  
  switch (activeFilter) {
    case Statuses.ACTIVE:
      visibleTodos = activeTodos;
      break;
  
    case Statuses.COMPLETED:
      visibleTodos = completedTodos;
      break;
  
    case Statuses.ALL:
    default:
      visibleTodos = Array.isArray(todos) ? todos : [];
  }

  const completedExist = !!completedTodos.length;
  const areAllCompleted = completedTodos.length === todos.length && !!todos.length;

  const inputRef = useRef<HTMLInputElement>(null);

  const errorTimeoutID = useRef(0);

  const handleError = (message: string) => {
    setHasError(true);
    setErrorMessage(message);
    errorTimeoutID.current = window.setTimeout(() => {
      setHasError(false);
    }, 3000);
  };

  useEffect(() => {
    if (hasError) {
      setHasError(false);
    }

    const fetchTodos = async () => {
      try {
        const response = await getTodos(USER_ID);
        const todos = response.data;
        setTodos(todos)
      } catch (error) {
        handleError('Error while fetching Todos')
      }
    }

    fetchTodos();

    return () => window.clearTimeout(errorTimeoutID.current);
  }, [activeFilter]);

  useEffect(() => {
    if (wasThereAdding) {
      inputRef.current?.focus();
    }
  }, [wasThereAdding]);

  const addTodo = async (event: React.FormEvent) => {
    event.preventDefault();

    window.clearTimeout(errorTimeoutID.current);

    if (!inputValue.trim()) {
      handleError("Title can't be empty");
      return;
    }

    const newTodoData = {
      title: inputValue.trim(),
      userId: USER_ID,
      completed: false,
    };

    setTempTodo({ id: 0, ...newTodoData });
    setWasThereAdding(false);
    setIsLoading(true);

    try {
      const response = await createTodo(newTodoData);
      const addedTodo = response.data;
      setTodos([...todos, addedTodo]);
      setInputValue('');
    } catch (error) {
      handleError('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setWasThereAdding(true);
      setIsLoading(false);
    };
  };

  const deleteTodoFrom = async (todoId: number) => {
    try {
      await deleteTodo(todoId);
      const existingTodos = [...todos].filter((todo) => todo.id !== todoId);
      setTodos(existingTodos)
    } catch (error) {
      handleError('Unable to delete a todo');
    }
  };

  const deleteAllCompleted = async () => {
    try {
      setAreAllCompletedDeleting(true);

      await Promise.all(completedTodos.map(todo => deleteTodo(todo.id)));
      setTodos(activeTodos);
    } catch (error) {
      handleError('Unable to delete todos');
    } finally {
      setAreAllCompletedDeleting(false);
    }
  }

  const updatedTodo = async (todoId: number, data: Todo) => {
    try {
      const response = await updateTodos(todoId, data);
      const updatedTodoData = response.data;
      setTodos(todos.map(todo => (todo.id === todoId ? updatedTodoData : todo)));
    } catch (error) {
      handleError('Unable to update a todo')
    }
  };

  const toggleAll = async () => {
    const promiseArray = (areAllCompleted ? completedTodos : activeTodos)
      .map(async todo => {
        const updatedTodoData = { ...todo, completed: !todo.completed };
        await updatedTodo(todo.id, updatedTodoData);
        return updatedTodoData;
      });
  
    setAreAllToggling(true);
  
    try {
      const updatedTodos = await Promise.all(promiseArray);
      setTodos(todos.map(todo => updatedTodos.find(updatedTodo => updatedTodo.id === todo.id) || todo));
    } catch (error) {
      handleError('Unable to toggle todos');
    } finally {
      setAreAllToggling(false);
    }
  };
  

  if (!USER_ID) {
    return <div>Error</div>
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">Tasks to do</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: areAllCompleted,
            })}
            onClick={toggleAll}
          />

          <form
            onSubmit={addTodo}
          >
            <input
              ref={inputRef}
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isLoading}
              onBlur={() => setWasThereAdding(false)}
            />
          </form>
        </header>

        <section className="todoapp__main">
          {visibleTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={deleteTodoFrom}
              onUpdate={updatedTodo}
              areAllCompletedDeleting={areAllCompletedDeleting}
              areAllToggling={areAllToggling}
              areAllCompleted={areAllCompleted}
            />
          ))}

          {tempTodo && (
            <div className="todo">
              <label className="todo__status-label">
                <input type="checkbox" className="todo__status" />
              </label>

              <span className="todo__title">{tempTodo.title}</span>
              <button type="button" className="todo__remove">×</button>

              <div className="modal overlay is-active">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          )}
        </section>

        {todos.length > 0 && (
          <footer className="todoapp__footer">
            <span className="todo-count">
              {`${activeTodos.length} items left`}
            </span>

            <TodoFilter
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />

            <button
              type="button"
              className={classNames('todoapp__clear-completed', {
                'todoapp__clear-completed--hidden': !completedExist,
              })}
              onClick={deleteAllCompleted}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !hasError },
        )}
      >
        <button
          type="button"
          className="delete"
          onClick={() => setHasError(false)}
        />

        {errorMessage}
      </div>
    </div>
  );
};
