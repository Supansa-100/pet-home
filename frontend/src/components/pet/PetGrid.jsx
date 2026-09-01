import { Grid, Box, Typography } from '@mui/material'
import PetCard from './PetCard'
import PetSkeleton from '../ui/PetSkeleton'
import EmptyState from '../ui/EmptyState'

const PetGrid = ({ pets = [], loading = false }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <PetSkeleton />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (pets.length === 0) {
    return null; // Let the parent component handle empty state for better customization
  }

  return (
    <Grid container spacing={3}>
      {pets.map((pet) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id}>
          <PetCard pet={pet} />
        </Grid>
      ))}
    </Grid>
  )
}

export default PetGrid
