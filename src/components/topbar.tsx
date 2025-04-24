import { FiMoon } from "react-icons/fi"

const TopBar = () => {
  return (
    <div className="min-h-21 flex w-full justify-between items-center px-6 select-none">
      <p className="font-bold text-3xl">feedback hub</p>
      <div className="w-6 h-6 cursor-pointer">
        <FiMoon size={24} />
      </div>
    </div>
  )
}

export default TopBar