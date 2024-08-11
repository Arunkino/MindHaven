const ServiceCard = ({ title, description, footer, imageUrl, titleColor, accentColor }) => {
    return (
      <div className="service-card bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="p-6">
          <img src={imageUrl} alt={title} className="w-24 h-24 mb-4" />
          <div className={`${accentColor} h-1 w-12 mb-4`}></div>
          <h3 className={`${titleColor} text-xl font-semibold mb-2`}>{title}</h3>
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          {footer && <p className="text-blue-800 font-semibold text-sm">{footer}</p>}
        </div>
      </div>
    );
  };
  

  export default ServiceCard;