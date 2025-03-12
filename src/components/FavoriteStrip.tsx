"use client"

const favorites = [
  "ETHUSDT -8.13%",
  "BTCUSDT +5.13%",
  "ADAUSDT -3.13%",
  "BNBUSDT +2.13%",
]

const FavoriteStrip = () => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row items-center justify-start">
        {/* <RiArrowLeftSLine className="size-7" /> */}
        <ul className="flex flex-row space-x-8">
          {favorites.map((favorite, index) => (
            <li key={`first-${index}`}>{favorite}</li>
          ))}
          {favorites.map((favorite, index) => (
            <li key={`second-${index}`}>{favorite}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-row items-center justify-end space-x-3" >
        {/* <FaPlus /> */}
        {/* <RiArrowRightSLine className="size-7" /> */}
      </div>
    </div>
  )
}

export default FavoriteStrip