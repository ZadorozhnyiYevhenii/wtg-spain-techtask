import classNames from 'classnames';
import { Statuses } from '../../types/Statuses';
import './TodoFilter.scss';

type Props = {
  activeFilter: Statuses,
  setActiveFilter: (value: Statuses) => void,
};

export const TodoFilter: React.FC<Props> = ({ activeFilter, setActiveFilter }) => {
  const isItActiveFilter = (filter: Statuses) => activeFilter === filter;

  const handleClick = (filter: Statuses) => {
    if (filter !== activeFilter) {
      setActiveFilter(filter);
    }
  };

  return (
    <nav className="filter">
      <a
        href="#/"
        className={classNames('filter__link', {
          selected: isItActiveFilter(Statuses.ALL),
        })}
        onClick={() => handleClick(Statuses.ALL)}
      >
        {Statuses.ALL}
      </a>

      <a
        href="#/active"
        className={classNames('filter__link', {
          selected: isItActiveFilter(Statuses.ACTIVE),
        })}
        onClick={() => handleClick(Statuses.ACTIVE)}
      >
        {Statuses.ACTIVE}
      </a>

      <a
        href="#/completed"
        className={classNames('filter__link', {
          selected: isItActiveFilter(Statuses.COMPLETED),
        })}
        onClick={() => handleClick(Statuses.COMPLETED)}
      >
        {Statuses.COMPLETED}
      </a>
    </nav>
  );
};
