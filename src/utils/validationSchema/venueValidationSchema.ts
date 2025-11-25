import * as Yup from 'yup';
export const venueSchema = Yup.object({
  name: Yup.string().required('Venue name is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  lat: Yup.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .required('Latitude is required'),
  lng: Yup.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .required('Longitude is required'),
  capacity: Yup.number().min(1, 'Capacity must be at least 1').required('Capacity is required'),
  description: Yup.string().required('Description is required'),
});
