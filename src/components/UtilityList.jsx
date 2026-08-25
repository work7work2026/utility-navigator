export default function UtilityList({
  utilities,
  selectedDestination,
  onSelect,
}) {

  if (!utilities.length) {
    return null;
  }


  return (
    <div className="utility-list-panel">

      <h3>
        Nearby Utilities
      </h3>


      <div className="utility-list">

        {utilities.map(
          (utility, index) => (

          <button

            key={utility.id}

            className={
              selectedDestination?.id === utility.id
              ? "utility-list-item active"
              : "utility-list-item"
            }


            onClick={() =>
              onSelect(utility)
            }

          >

            <div className="utility-number">

              {index + 1}

            </div>


            <div className="utility-details">

              <strong>
                {utility.name}
              </strong>


              <span>

                {utility.straightDistance.toFixed(2)}
                {" "}km away

              </span>


            </div>


          </button>

        ))}

      </div>

    </div>
  );
}